import timers
import threading
import sys

def run_turn_timer():
    timers.turnTimer()
    print('TURN_TIMER_DONE', flush=True)

if __name__ == '__main__':
    run_turn_timer()
