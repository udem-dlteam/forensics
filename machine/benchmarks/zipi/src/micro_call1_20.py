# micro_call1_20.py
# Auto-generated

import time

bench_iterations = 100000
bench_duplications = 1

def bench_exec():
    def one1(a): return 1
    def one2(a): return 1
    def one3(a): return 1
    def one4(a): return 1
    def one5(a): return 1
    def call(x,one):
        while x>0:x-=one(x)
    bench_counter = bench_iterations
    while bench_counter > 0:
        bench_counter -= 1
        n=20
        call(n,one1);call(n,one2);call(n,one3);call(n,one4);call(n,one5);
    

bench_time = time.time()
bench_exec()
bench_time = time.time() - bench_time
print(str(bench_time) + ' seconds for ' + str(bench_iterations*bench_duplications) + ' executions of: ' + 'call(n,one1);call(n,one2);call(n,one3);call(n,one4);call(n,one5);')


