# micro_var_float_str_eq_var.py
# Auto-generated

import time

bench_iterations = 1300000
bench_duplications = 30

def bench_exec():
    x=1.5;y="foo"
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
        z = x==y
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'z = x==y')


