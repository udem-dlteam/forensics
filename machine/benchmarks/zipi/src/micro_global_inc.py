# micro_global_inc.py
# Auto-generated

import time

bench_iterations = 700000
bench_duplications = 40

def bench_exec():
    global g
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        g=0
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
        g+=1
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'g+=1')


