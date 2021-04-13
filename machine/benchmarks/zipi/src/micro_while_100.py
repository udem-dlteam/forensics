# micro_while_100.py
# Auto-generated

import time

bench_iterations = 100000
bench_duplications = 1

def bench_exec():
    
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        x=250
        while x>0:x-=1
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'while x>0:x-=1')


