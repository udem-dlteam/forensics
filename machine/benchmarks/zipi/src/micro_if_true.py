# micro_if_true.py
# Auto-generated

import time

bench_iterations = 3000000
bench_duplications = 30

def bench_exec():
    true=True
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
        if true:x=0
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'if true:x=0')


