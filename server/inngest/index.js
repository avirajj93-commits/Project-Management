import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project management" });

const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    {event: 'clerk.user.created'},
    async ({ event }) => {
        const {data} = event
        await prisma.user.create({
            data: {
                id: data.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)
// TO DELETE THE USER IN PRISMA DB WHEN DELETED IN CLERK

const syncUserDeletion = inngest.createFunction(
    { id: 'sync-user-deletion-from-clerk' },
    {event: 'clerk.user.deleted'},
    async ({ event }) => {
        const {data} = event
        await prisma.user.delete({
            where: {
                id: data.id,

            }
        })
    }
)

//INNGEST FUNCTION TO UPDATE USER DATA IN DATABASE
const syncUserUpdation = inngest.createFunction(
    { id: 'sync-user-updation-from-clerk' },
    {event: 'clerk.user.updated'},
    async ({ event }) => {
        const {data} = event
        await prisma.user.update({
            where: {
                id: data.id
            },
            data: {
                
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)
const syncWorkspaceCreation = inngest.createFunction(
    {id: 'sync-workspace-from-clerk' },   
    {event: 'clerk/organization.created'},
    async ({event}) => {
        const {data} = event;
        await prisma.workspace.create({
            data: {
                id: data.id,
                name: data.name,
                slug: data.slug,
                    ownerId: data.created_by,
                    image_url: data.image_url,
            }
        })
        //ADD CREATOR AS ADMIN MEMBER IN WORKSPACE
        await prisma.workspaceMember.create({
            data: {
                userId: data.created_by,
                workspaceId: data.id,
                role: 'ADMIN',
            }
        })
    }
)
//INNGEST FUNCTION TO UPDATWE WORKSPACE DATA IN DATABASE
const syncWorkspaceUpdation = inngest.createFunction(
    {id: 'update-workspace-from-clerk' },   
    {event: 'clerk/organization.updated'},
    async ({event}) => {
        const {data} = event;
        await prisma.workspace.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                slug: data.slug,
                image_url: data.image_url,
            }
        })
    }
)

//INNGEST FUNCTION TO DELETE WORKSPACE DATA IN DATABASE 
const syncWorkspaceDeletion = inngest.createFunction(
    {id: 'delete-workspace-with-clerk' },   
    {event: 'clerk/organization.deleted'},
    async ({event}) => {
        const {data} = event;
        await prisma.workspace.delete({
            where: {
                id: data.id,
            }
        })
    }
)

//INNGEST FUNCTION TO ADD MEMBER TO WORKSPACE IN DATABASE
const syncWorkspaceMemberCreation = inngest.createFunction(
    {id: 'sync-workspace-member-with-clerk' },   
    {event: 'clerk/organization.Invitation.accepted'},
    async ({event}) => {
        const {data} = event;   
        await prisma.workspaceMember.create({
            data: {
                userId: data.user_id,           
                workspaceId: data.organization_id,
                role: String(data.role_name).toUpperCase(),
            }
        })
    }
)


//INNGEST FUNCTRION TO SENT EMAIL OS TASK CREATION
const sendTaskAssignmentEmail = inngest.createFunction(
  { id: 'send-task-assignment-email' },
  { event: "app/task.assigned" },
  async ({ event, step }) => {
    const { taskId, origin } = event.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, project: true }
    });

    await sendEmail({
      to: task.assignee.email,
      subject: `New Task Assignment: ${task.project.name}`,
      body: `Hi ${task.assignee.name}
${task.title}
${new Date(task.due_date).toLocaleDateString()}
<a href="${origin}"> View Task </a>`
    });

    if (
      new Date(task.due_date).toLocaleDateString() !==
      new Date().toLocaleDateString()
    ) {
      await step.delay(new Date(task.due_date));

      await sendEmail({
        to: task.assignee.email,
        subject: `Task Due Today: ${task.project.name}`,
        body: `Hi ${task.assignee.name}
${task.title}
is due today. Please make sure to complete it on time.
<a href="${origin}"> View Task </a>`
      });

      if (
        new Date(task.due_date).toLocaleDateString() !==
        new Date().toDateString()
      ) {
        await step.sleepUntil(
          'wait-for-the-due-date',
          new Date(task.due_date)
        );

        await step.run('check-if-task-is-completed', async () => {
          const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { assignee: true, project: true }
          });

          if (!task) return;

          if (task.status !== 'COMPLETED') {
            await step.run('send-task-reminder-mail', async () => {
              await sendEmail({
                to: task.assignee.email,
                subject: `Reminder for ${task.project.name}`,
                body: `Hi ${task.assignee.name}
${task.title}
${new Date(task.due_date).toLocaleDateString()}
<a href="${origin}"> View Task </a>`
              });
            });
          }
        });
      }
    }
  }
);
// Create an empty array where we'll export future Inngest functions

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, syncWorkspaceCreation, syncWorkspaceUpdation, syncWorkspaceDeletion, syncWorkspaceMemberCreation, sendTaskAssignmentEmail    ];