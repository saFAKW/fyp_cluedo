import time

def startGameTimer():
    startTime = time.time()
    return startTime

def getGameTime(startTime):
    return time.time() - startTime

def turnTimer():
    turnStartTime = time.time()
    while True:
        if (time.time() - turnStartTime) > 60:
            return True
        time.sleep(1)