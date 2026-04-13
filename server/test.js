import prisma from "./configs/prisma.js";

async function insertUser() {
    try {
        const user = await prisma.user.create({
            data: {
                id: "user_3C2BS63lqfIcUS52gcwzR8VMQJe", // 👈 SAME Clerk ID
                email: "test@example.com",
                name: "Test User",
                image: ""
            }
        });

        console.log("✅ USER CREATED:", user);

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
}

insertUser();