# micro_call_keyword1.py
# Auto-generated

import time

bench_iterations = 700000
bench_duplications = 30

def bench_exec():
    def f(x=1): pass
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
        f(x=3)
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'f(x=3)')


