const socket=io()
//elements
const $messageForm = document.querySelector('#message-form') 
const $messageForminput = $messageForm.querySelector('input')
const $messageFormbutton =$messageForm.querySelector('button')
const $locationFormbutton=document.querySelector('#loc')
const $messages=document.querySelector('#messages')

//template
const $messageTemplate=document.querySelector('#message-template').innerHTML
const $locmessageTemplate=document.querySelector('#loc-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//option
const {username,room }=Qs.parse(location.search,{ ignoreQueryPrefix: true})

const autoscroll=()=>{
    //new message element 
    const $newmessage = $messages.lastElementChild

    //height of the new message
    const newmessagestyle=getComputedStyle($newmessage)
    const newmessagemargin=parseInt(newmessagestyle.marginBottom)
    const newmessageheight=$newmessage.offsetHeight +newmessagemargin

    //visible height
    const visibleHeight= $messages.offsetHeight

    //height of message container
    const containerheight = $messages.scrollHeight

    //how far have i scrolled
    const scrolloffset = $messages.scrollTop + visibleHeight

    if(containerheight-newmessageheight<=scrolloffset){
        $messages.scrollTop=$messages.scrollHeight
    }


}

socket.on('message',(message)=>{
    console.log(message)
    const html= Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
}) 
socket.on('locmessage',(message)=>{
    console.log(message)
    const html= Mustache.render($locmessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm A')        
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html= Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disabled button
    $messageFormbutton.setAttribute('disabled','disabled')

    //const message=document.querySelector('input').value
    const message=e.target.elements.Msg.value
    socket.emit('sendMsg',message,(error)=>{
        //enabled button
        $messageFormbutton.removeAttribute('disabled')
        $messageForminput.value=""
        $messageForminput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})    


/*
socket.on('countUpdated',(count)=>{
    console.log('the count has been updated',count)
})

document.querySelector('#increment').addEventListener('click',()=>{
    console.log('clicked')
    socket.emit('increment')
})*/

$locationFormbutton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $locationFormbutton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
            //console.log(position)
            socket.emit('sendloc',{
                latitude:position.coords.latitude,
                longitude:position.coords.longitude
            },()=>{
                $locationFormbutton.removeAttribute('disabled')
                console.log('Location Shared!')
            })
    })
}) 
socket.emit('join',{ username,room},(error)=>{
    if (error) {
        alert(error)
        location.href = '/'
    }
})