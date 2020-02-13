import frida
import sys

session = frida.attach("PwnAdventure3-Linux-Shipping")

with open("injectedScript.js", "r") as f:
    script = session.create_script(f.read())

def on_message(message, data):
    print(message)

script.on('message', on_message)
script.load()
sys.stdin.read()
