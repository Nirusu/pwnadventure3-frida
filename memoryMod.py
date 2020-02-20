import frida
import sys
import os

session = frida.attach("PwnAdventure3-Linux-Shipping")

stream = os.popen('gdb -p  $(pidof PwnAdventure3-Linux-Shipping) --batch --ex "p (Player*)((ClientWorld*)GameWorld).m_activePlayer.m_object" -ex "quit" | awk \'/\$1/ {print}\' | grep "$1" | awk \'{print $5}\'')
playerMemAddress = stream.read().rstrip()

script = session.create_script("""

	var Player = ptr("%s");
	console.log("Player at address: " + Player);

	var m_walkingSpeed = ptr(Player.add(736));	//m_walkingSpeed memory address offset from playerMemAddress
    var m_jumpSpeed = ptr(Player.add(740));		//m_jumpSpeed memory address offset from playerMemAddress
    var m_jumpHoldTime = ptr(Player.add(744));	//m_jumpHoldTime memory address offset from playerMemAddress

	console.log(" ");
	console.log("m_walkingSpeed at address\t: " + m_walkingSpeed);
	console.log("m_jumpSpeed at address   \t: " + m_jumpSpeed);
	console.log("m_jumpHoldTime at address\t: " + m_jumpHoldTime);

	var walkingSpeed = Memory.readFloat(m_walkingSpeed);
	var jumpSpeed = Memory.readFloat(m_jumpSpeed);
	var jumpHoldTime = Memory.readFloat(m_jumpHoldTime);
	console.log(" ");
	console.log("Current walkingSpeed value\t= " + walkingSpeed);
	console.log("Current jumpSpeed value   \t= " + jumpSpeed);
	console.log("Current jumpHoldTime value\t= " + jumpHoldTime);


	Memory.writeFloat(m_walkingSpeed, 2000);
	Memory.writeFloat(m_jumpSpeed, 2000);
	Memory.writeFloat(m_jumpHoldTime, 10);


/*
	Memory.writeFloat(m_walkingSpeed, 200);
	Memory.writeFloat(m_jumpSpeed, 420);
	Memory.writeFloat(m_jumpHoldTime, 0.20000000298023224);
*/

	console.log(" ");
	console.log("New walkingSpeed value\t= " + walkingSpeed);
	console.log("New jumpSpeed value   \t= " + jumpSpeed);
	console.log("New jumpHoldTime value\t= " + jumpHoldTime);
	console.log(" ");

""" % playerMemAddress)

def on_message(message, data):
    print(message)

script.on('message', on_message)
script.load()
#sys.stdin.read()
