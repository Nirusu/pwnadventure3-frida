# Extract exports & demangle it
# From https://x-c3ll.github.io/posts/Frida-Pwn-Adventure-3/

import frida
import cxxfilt


session = frida.attach("PwnAdventure3-Linux-Shipping")
script = session.create_script("""
    var exports = Module.enumerateExportsSync("libGameLogic.so");
    for (var i = 0; i < exports.length; i++) {
        send(exports[i].name);
    }
""")

def on_message(message, data):
    print(message["payload"] + " - " + cxxfilt.demangle(message["payload"]))

script.on('message', on_message)
script.load()
