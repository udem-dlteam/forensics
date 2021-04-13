# micro_method_bind.py
# Auto-generated

import time

bench_iterations = 900000
bench_duplications = 30

def bench_exec():
    s="a"
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
        x=s.__add__
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'x=s.__add__')


