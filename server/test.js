import prisma from "./configs/prisma.js";

async function insertUser() {
    try {
        const user = await prisma.user.create({
            data: {
                id: "user_3C2BS63lqfIcUS52gcwzR8VMQJe", // 👈 SAME Clerk ID
                email: "bznxjdo@gmail.com",
                name: "Aviraj Singh",
                image: ""
            }
        });

        console.log("✅ USER CREATED:", user);

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
}

insertUser();