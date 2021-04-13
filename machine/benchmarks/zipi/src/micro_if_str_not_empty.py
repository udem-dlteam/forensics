# micro_if_str_not_empty.py
# Auto-generated

import time

bench_iterations = 3000000
bench_duplications = 30

def bench_exec():
    not_empty="foo"
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
        if not_empty:x=0
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'if not_empty:x=0')


