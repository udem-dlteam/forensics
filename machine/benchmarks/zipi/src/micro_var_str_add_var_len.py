# micro_var_str_add_var_len.py
# Auto-generated

import time

bench_iterations = 100000
bench_duplications = 30

def bench_exec():
    s="a"
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
        x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'x=s+s;x=x+x;x=x+x;x=x+x;x=x+x;x=x+x;x=len(x)')


