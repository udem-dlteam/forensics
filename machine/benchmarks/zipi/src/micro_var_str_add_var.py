# micro_var_str_add_var.py
# Auto-generated

import time

bench_iterations = 700000
bench_duplications = 30

def bench_exec():
    s1="a";s2="b"
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
        x=s1+s2
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'x=s1+s2')


