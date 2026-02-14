import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

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
                name: data?.first_name + " " + data?.last_name
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
                name: data?.first_name + " " + data?.last_name
                image: data?.image_url,
            }
        })
    }
)
// Create an empty array where we'll export future Inngest functions

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];