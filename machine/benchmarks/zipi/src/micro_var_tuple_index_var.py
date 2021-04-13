# micro_var_tuple_index_var.py
# Auto-generated

import time

bench_iterations = 1600000
bench_duplications = 30

def bench_exec():
    tup=(0,);y=0
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
        x=tup[y]
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'x=tup[y]')


