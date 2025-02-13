


window.onload=function(){

const navul =document.getElementById("nav-list-id")
const nav_link=navul.querySelectorAll('a')
const current_path=window.location.pathname

nav_link.forEach(function(element){
    if(element.getAttribute("href")===current_path){
        element.classList.add("loaded")  
        }
    else{
        element.classList.remove("loaded")
    }
  })

}