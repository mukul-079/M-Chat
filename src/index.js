const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generatemessage,locgeneratemessage }=require('./utils/message')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app= express()
const server = http.createServer(app)
const io = socketio(server)


const port=process.env.PORT||3000
const publicDirectoryPath=path.join(__dirname,'../public')

//let count=0
io.on('connection',(socket)=>{
    console.log("new socket.io connection")
    //socket.emit('message',generatemessage('Welcome!'))
    //socket.broadcast.emit('message',generatemessage('A new user joined'))

    socket.on('join',(/*{username,room}*/options,callback)=>{
        const {error,user}=addUser({id:socket.id,...options/*username,room*/})
        if(error){
            return callback(error)
        }


        socket.join(user.room)
            socket.emit('message',generatemessage('Admin','Welcome!'))
            socket.broadcast.to(user.room).emit('message',generatemessage('Admin',`${user.username} has joined!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })

        callback()    
        //socket.emit,io.emit,socket.broadcast.emit
        //io.to.emit(everybody who is in the room),socket.broadcast.to.emit
    })

    socket.on("sendMsg",(message,callback)=>{
        const filter=new Filter()
        const user=getUser(socket.id)

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message',generatemessage(user.username,message))
        callback()

    /*socket.emit('countUpdated',count)
    
    socket.on("increment",()=>{
        count++
        //socket.emit('countUpdated',count)
        io.emit('countUpdated',count)*/
    })

    socket.on("disconnect",()=>{
        const user=removeUser(socket.id)
        if(user){
        io.to(user.room).emit('message',generatemessage('Admin',`${user.username} has left`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        }
    })


    socket.on("sendloc",(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locmessage',locgeneratemessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
})

app.use(express.static(publicDirectoryPath))

/*app*/server.listen(port ,()=>{
    console.log(`server is up on port ${port}!`)
})