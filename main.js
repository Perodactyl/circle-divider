/**@type {HTMLCanvasElement}*/
var canv = document.getElementById("circleCanvas")
/**@type {CanvasRenderingContext2D}*/
var ctx = canv.getContext("2d")
var rules = document.getElementById("rules")
var type = document.getElementById("settings")
type.onchange = update
var out = document.getElementById("outline")
var light = false
class Vector2{
    x=0
    y=0
    constructor(x=0,y=0){
        this.x = x
        this.y = y
    }
}
if(!light){
	ctx.strokeStyle = "white"
}
var center = new Vector2(150, 150)
/**
 * 
 * @param {Number} rad The radius of the circle
 * @param {Vector2} pos The position of the circle
 * @param {boolean} fill
 */
function drawCircle(rad, pos, fill=false){
	if(rad <= 0){
		return
	}
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, rad, 0, Math.PI*2)
    if(fill){
        ctx.fill()
    }else{
        ctx.stroke()
    }
}
var offset = new Vector2()
var rad = 150
function addRule(){
    var newRule = document.createElement("div")
    newRule.dataset.whole = "no"
    newRule.dataset.value = "180"
	newRule.dataset.color = "#000000"
    var whole = document.createElement("input")
    whole.type = "checkbox"
    whole.onchange = ()=>{
        newRule.dataset.whole = whole.checked ? "yes" : "no"
		update()
    }
    newRule.append(whole)
    var slider = document.createElement("input")
    slider.type = "range"
    slider.min = 0
    slider.max = 360
    slider.value = 180
	slider.classList.add("ruleElem")
	var slideInt = 0
	slider.onmousedown = ()=>{
		slideInt = setInterval(update, 25)
	}
	slider.onmouseup = ()=>{
		if(slideInt){
			clearInterval(slideInt)
			slideInt = 0
		}
	}
    newRule.append(slider)
    var rawIn = document.createElement("input")
    rawIn.type = "number"
    rawIn.min = -1
    rawIn.max = 361
    rawIn.value = 180
    newRule.append(rawIn)
    slider.onchange = ()=>{
        newRule.dataset.value = slider.value
        rawIn.value = slider.value
		update()
    }
	slider.onmousemove = ()=>{
		slider.onchange()
	}
    rawIn.onchange = ()=>{
        if(rawIn.value > 360){
            rawIn.value = rawIn.value-360
        }
        if(rawIn.value < 0){
            rawIn.value = 360 + Number(rawIn.value)
        }
        newRule.dataset.value = rawIn.value
        slider.value = rawIn.value
		update()
    }
	var color = document.createElement("input")
	color.type = "color"
	color.onchange = ()=>{
		newRule.dataset.color = color.value
	}
	//newRule.append(color)
    var killButton = document.createElement("button")
    killButton.innerText = "Delete"
    killButton.onclick = ()=>{
        newRule.remove()
		update()
    }
    newRule.append(killButton)
    rules.append(newRule)
	update()
}
function update(){
	if(light){
		ctx.strokeStyle = "#000000"
	}
	var circRule = type.value
	var rules = $("#rules")[0].children
	var additive = $("#additive")[0].checked
	var addAngle = 0
    ctx.clearRect(0, 0, canv.width, canv.height)
	if(out.checked && rad){
		let oldStroke = ctx.strokeStyle
		ctx.strokeStyle = light ? "#00000088" : "#FFFFFF88"
		drawCircle(rad-1, center, false)
		ctx.strokeStyle = oldStroke
	}
	if(circRule == "full" && rad){
    	drawCircle(rad-1, center)
	}
	ctx.save()
	ctx.translate(center.x, center.y)
	var moved = false
	var currentPos = 0
	var linePos = new Vector2()
	var startPos = new Vector2()
	var startAngle = 0
	for(let i = 0; i < rules.length; i++){
		let val = Number(rules[i].dataset.value)
		if(additive){
			addAngle += val
			val = addAngle
		}
		let whole = rules[i].dataset.whole == "yes"
		val *= (Math.PI/180)
		let x = Math.cos(val)*(rad-1)
		let y = Math.sin(val)*(rad-1)
		if(circRule == "between" || circRule == "betret"){
			if(!moved){
				moved = true
				ctx.moveTo(x, y)
				currentPos = val
				startAngle = val
			}else{
				ctx.beginPath()
				if(rad > 0)ctx.arc(0, 0, rad-1, currentPos, val)
				if(i+1 == rules.length && circRule == "betret" && rad > 0){
					ctx.arc(0, 0, rad-1, val, startAngle)
				}
				ctx.stroke()
				currentPos = val
			}
		}
		if(circRule == "line" || circRule == "lineret"){
			if(!moved){
				moved = true
				ctx.moveTo(x,y)
				linePos = new Vector2(x, y)
				startPos = new Vector2(x, y)
			}else{
				ctx.beginPath()
				ctx.moveTo(linePos.x, linePos.y)
				ctx.lineTo(x,y)
				if(i+1 == rules.length && circRule == "lineret"){
					ctx.lineTo(startPos.x, startPos.y)
				}
				ctx.stroke()
				ctx.moveTo(x,y)
				linePos = new Vector2(x, y)
			}
		}
		if(circRule == "ret"){
			if(!moved){
				moved = true
				ctx.moveTo(x,y)
				startPos = new Vector2(x, y)
			}else{
				ctx.beginPath()
				ctx.moveTo(startPos.x, startPos.y)
				ctx.lineTo(x,y)
				ctx.stroke()
				ctx.moveTo(x,y)
			}
		}
		ctx.beginPath()
		ctx.moveTo(offset.x, offset.y)
		ctx.lineTo(x, y)
		if(whole){
			ctx.moveTo(offset.x, offset.y)
			ctx.lineTo(-x, -y)
		}
		ctx.stroke()
	}
	ctx.restore()
}
update()