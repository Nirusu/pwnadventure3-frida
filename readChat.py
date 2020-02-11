# Log chat
import frida
import sys

session = frida.attach("PwnAdventure3-Linux-Shipping")
script = session.create_script("""
        //Find "Player::Chat"
        var chat = Module.findExportByName("libGameLogic.so", "_ZN6Player4ChatEPKc");
        console.log("Player::Chat() at  address: " + chat);

        Interceptor.attach(chat, {
            onEnter: function (args) { // 0 => this; 1 => cont char* (our text)
            var chatMsg = Memory.readCString(args[1]);
            console.log("[Chat]: " + chatMsg);
            }

        });
""")

script.load()
sys.stdin.read()