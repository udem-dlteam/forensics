# micro_global_read.py
# Auto-generated

import time

bench_iterations = 2000000
bench_duplications = 40

def bench_exec():
    global g;x=0
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        g=0
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
        x=g
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'x=g')


