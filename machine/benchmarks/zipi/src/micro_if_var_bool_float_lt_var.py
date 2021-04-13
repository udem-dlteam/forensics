# micro_if_var_bool_float_lt_var.py
# Auto-generated

import time

bench_iterations = 1600000
bench_duplications = 30

def bench_exec():
    x=True;y=2.
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
        if x<y:x=0.
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'if x<y:x=0.')


