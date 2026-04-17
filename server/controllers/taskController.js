import { inngest } from "../inngest/index.js";
import prisma from "../configs/prisma.js";

//create task
export const createTask = async (req, res) => {
    try {
        const {userId} = await req.auth();
        
        const {projectId,title, description,type, status, priority, due_Date, assigneeId} = req.body;
 const origin = req.get('origin')

 // check if user has admin role for project
    const project = await prisma.project.findUnique({
        where: {id: projectId},
        include: {members:{include:{user:true}}}
    })

    if(!project){
        return res.status(404).json({ message: "Project not found" });      
    } else if(project.team_lead !== userId){
        return res.status(403).json({ message: "You don't have admin privileges for this project" });
    }
    else if(assigneeId && !project.members.find((member)=> member.user.id === assigneeId)){
        return res.status(404).json({ message: "Assignee must be a member of the project" });   
    }

    const task = await prisma.task.create({
        data:{
            projectId,
            title,
            description,
           priority,
           assigneeId,
           status,
           due_Date: new Date(due_Date)
        }
    })
     
    const taskWithAssignee = await prisma.task.findUnique({
        where: {id: task.id},
        include: {assignee:true}
    })    
    await inngest.send({
        name:"app/task.assigned",
        data: {
            taskId: task.id,
            origin
        }
    })  
    res.json({task: taskWithAssignee, message: "Task created successfully"})
   
    
    }catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message});
    }
}



// update task

export const updateTask = async (req, res) => {
    try {
        const task = await prisma.task.findUnique({
            where: {id: req.params.id},
            
        })

        if(!task){
            return res.status(404).json({ message: "Task not found" });
        }

        const {userId} = await req.auth();
        

 // check if user has admin role for project
    const project = await prisma.project.findUnique({
        where: {id: task.projectId},
        include: {members:{include:{user:true}}}
    })

    if(!project){
        return res.status(404).json({ message: "Project not found" });      
    } else if(project.team_lead !== userId){
        return res.status(403).json({ message: "You don't have admin privileges for this project" });
    }
    
const updatedTask = await prisma.task.update({
    where: {id: req.params.id},
    data: req.body
})


     
    
    res.json({task: updatedTask, message: "Task updated successfully"})
   
    
    }catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message});
    }
}

// delete task

export const deleteTask = async (req, res) => {
    try {
        
const {userId} = await req.auth();
     const{taskIds} = req.body;
     const tasks = await prisma.task.findMany({
    where: {id: {in: taskIds}},
})   
if(tasks.length === 0){
    return res.status(404).json({ message: "No tasks found" });
}   

 
    const project = await prisma.project.findUnique({
        where: {id: tasks[0].projectId},
        include: {members:{include:{user:true}}}
    })

    if(!project){
        return res.status(404).json({ message: "Project not found" });      
    } else if(project.team_lead !== userId){
        return res.status(403).json({ message: "You don't have admin privileges for this project" });
    }

await prisma.task.deleteMany({
    where: {id: {in: taskIds}},
})

     
    
    res.json({message: "Task deleted successfully"})
   
    
    }catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message});
    }
}


