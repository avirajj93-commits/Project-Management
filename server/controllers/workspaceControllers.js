import prisma from "../configs/prisma.js";

// ✅ GET USER WORKSPACES
export const getuserWorkspaces = async (req, res) => {
    try {
        const { userId } = req.auth();

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: {
                    include: { user: true }
                },
                projects: {
                    include: {
                        tasks: {
                            include: {
                                assignee: true
                            }
                        }
                    }
                },
                owner: true
            }
        });

        res.json({ workspaces });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// ✅ ADD MEMBER TO WORKSPACE
export const addMember = async (req, res) => {
    try {
        const { userId } = req.auth();  // ✅ FIXED HERE ALSO

        const { email, role, workspaceId, message } = req.body;

        // 🔍 check if user exists
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!workspaceId || !role) {
            return res.status(400).json({
                message: 'Workspace ID and role are required'
            });
        }

        if (!["ADMIN", "MEMBER"].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // 🔍 FETCH WORKSPACE
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { members: true }
        });

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // 🔐 check admin permission
        const isAdmin = workspace.members.find(
            (member) =>
                member.userId === userId && member.role === 'ADMIN'
        );

        if (!isAdmin) {
            return res.status(401).json({
                message: 'Only workspace admins can add members'
            });
        }

        // 🔁 check if already member
        const existingMember = workspace.members.find(
            (member) => member.userId === user.id
        );

        if (existingMember) {
            return res.status(400).json({
                message: 'User is already a member of this workspace'
            });
        }

        // ✅ create member
        const member = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId,
                role,
                message
            }
        });

        res.json({ message: 'Member added successfully', member });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};