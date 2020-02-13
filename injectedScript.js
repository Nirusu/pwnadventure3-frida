// Global Values
var Player = {
    m_walkingSpeed : 200,
};
// Cheat status
var cheatStatus = {
    walkingSpeed : 0,
    fly : 0,
};
function chatHelper(msg, thisReference) {
var token = msg.split(" ");
if (token[0] === "!fly_on") {
    console.log("[CHEAT]: Flying enabled.");
    cheatStatus.fly = 1;
}
if (token[0] === "!fly_off") {
    console.log("[CHEAT]: Flying disabled.");
    cheatStatus.fly = 0;
}
if (token[0] === "!wspeed_on") {
    Player.m_walkingSpeed = parseInt(token[1]);
    cheatStatus.walkingSpeed = 1;
    console.log("[CHEAT]: Walking Speed Enabled (" + token[1] + ")");
}
if (token[0] === "!dlc") {
    console.log("[CHEAT]: DLC key submitted.");
    activateDLC(thisReference);
}
if (token[0] == "!gp") {
    console.log("[CHEAT] Trying to get position...");
    locate(thisReference);
}
if (token[0] === "!wspeed_off") {
    Player.m_walkingSpeed = 200;
    cheatStatus.walkingSpeed = 0;
    console.log("[CHEAT]: Walking Speed Disabled (200)");
}
if (token[0] === "!tp") {
    console.log("[CHEAT]: Teleporting to " + token[1] + " " + token[2] + " "+ token[3]);
    teleport(thisReference, parseInt(token[1]), parseInt(token[2]), parseInt(token[3]));
    }
}
var getPositionAddr = Module.findExportByName("libGameLogic.so", "_ZN5Actor11GetPositionEv");
console.log("Actor::GetPosition() at  address: " + getPositionAddr);
var getPosition = new NativeFunction(getPositionAddr, ['float', 'float', 'float'], ['pointer']);
function locate(thisReference) {
    var returnPtr = getPosition(thisReference);
    console.log(returnPtr[0]);
    console.log(returnPtr[1]);
    console.log(returnPtr[2]);
}
var setPositionAddr = Module.findExportByName("libGameLogic.so", "_ZN5Actor11SetPositionERK7Vector3");
console.log("Actor::SetPosition() at  address: " + setPositionAddr);
var setPosition = new NativeFunction(setPositionAddr, 'void', ['pointer', 'pointer']);
var Vector3 = Memory.alloc(16);
function teleport(thisReference, x, y, z) {
    Memory.writeFloat(Vector3, x);
    Memory.writeFloat(ptr(Vector3).add(4), y);
    Memory.writeFloat(ptr(Vector3).add(8), z);
    setPosition(thisReference, Vector3);
}
    //Find "Player::Chat"
var chat = Module.findExportByName("libGameLogic.so", "_ZN6Player4ChatEPKc");
console.log("Player::Chat() at  address: " + chat);
// Add our logger
Interceptor.attach(chat, {
    onEnter: function (args) { // 0 => this; 1 => cont char* (our text)
        var chatMsg = Memory.readCString(args[1]);
        console.log("[Chat]: " + chatMsg);
        chatHelper(chatMsg, args[0]);
    }
});
    // Find Player::GetWalkingSpeed()
var walkSpeed = Module.findExportByName("libGameLogic.so", "_ZN6Player15GetWalkingSpeedEv");
console.log("Player::GetWalkingSpeed() at address: " + walkSpeed);
// Check Speed
Interceptor.attach(walkSpeed,
    {
        // Get Player * this location
        onEnter: function (args) {
            //console.log("Player at address: " + args[0]);
            this.walkingSpeedAddr = ptr(args[0]).add(736) // Offset m_walkingSpeed
            //console.log("WalkingSpeed at address: " + this.walkingSpeedAddr);
        },
        // Get the return value
        onLeave: function (retval) {
            if (Memory.readFloat(this.walkingSpeedAddr) != Player.m_walkingSpeed && cheatStatus.walkingSpeed == 0) {
                Memory.writeFloat(this.walkingSpeedAddr, 200);
            }
            if (cheatStatus.walkingSpeed == 1) {
                Memory.writeFloat(this.walkingSpeedAddr, Player.m_walkingSpeed);
            }
        }
    });

var jumpState = Module.findExportByName("libGameLogic.so", "_ZN6Player12SetJumpStateEb");
console.log("Player::SetJumpState() at address: " + jumpState);
Interceptor.attach(jumpState,
{
    // Get Player * this location
    onEnter: function (args) {
        console.log("Player at address: " + args[0]);
        this.jumpSpeedAddr = ptr(args[0]).add(740) // Offset m_jumpSpeed
        this.jumpHoldTime = ptr(args[0]).add(744) // Offset m_jumpHoldTime
        console.log("JumpSpeed at address: " + this.jumpSpeedAddr);
        console.log("JumpHoldTime at address: " + this.jumpHoldTime);
        if (cheatStatus.fly == 1) 
        {
            Memory.writeFloat(this.jumpSpeedAddr, 800);
            Memory.writeFloat(this.jumpHoldTime, 10);
        }
        else
        {
            // Original values read out from memory
            Memory.writeFloat(this.jumpSpeedAddr, 420);
            Memory.writeFloat(this.jumpHoldTime, 0.20000000298023224);
        }
    }
});
// Find Player::SubmitDLCKey()
var dlcSubmitAddr = Module.findExportByName("libGameLogic.so", "_ZN6Player12SubmitDLCKeyEPKc");
var dlcSubmit = new NativeFunction(dlcSubmitAddr, 'void', ['pointer', 'pointer']);
console.log("Player::SubmitDLCKey() at address: " + dlcSubmitAddr);
function activateDLC(thisReference) {
    console.log("Trying to activate DLC...");
    var validKey = Memory.allocUtf8String("6R87D-Y0AVZ-NA3X5-ME2DK-NUA0W");
    dlcSubmit(thisReference, validKey);
    console.log("Submitted DLC. Did it work?");
}
Interceptor.attach(dlcSubmitAddr, {
    onEnter: function (args) {
        console.log("This function was entered!");
        console.log(Memory.readUtf8String(args[1]));
        // Valid Key taken from: http://0xebfe.net/blog/2015/01/24/ghost-in-the-shellcode-2015-pirates-treasure-500-write-up/
        var validKey = Memory.allocUtf8String("6R87D-Y0AVZ-NA3X5-ME2DK-NUA0W");
        this.validKey = validKey;
        args[1] = validKey;
        console.log("New value is: " + Memory.readUtf8String(args[1]));
        console.log("This function was exited!!");
    }
});