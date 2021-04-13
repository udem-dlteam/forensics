import time
import sys

class Cons(object):
    def __init__(self, a, d):
        self.car = a;
        self.cdr = d;

def interval( min, max ):
    if min > max:
        return []
    else:
        return Cons( min, interval( min + 1, max ) )

def sfilter( p, l ):
    if l == []:
        return l
    else:
        a = l.car
        r = l.cdr

        if p( a ):
            return Cons( a, sfilter( p, r ) )
        else:
            return sfilter( p, r )

def remove_multiples_of( n, l ):
    return sfilter( lambda m: m % n != 0, l )

def sieve( max ):
    def filter_again( l ):
        if l == []:
            return l
        else:
            n = l.car
            r = l.cdr

            if n * n > max:
                return l
            else:
                return Cons( n, filter_again( remove_multiples_of( n, r ) ) )
    return filter_again( interval( 2, max ) )

def length( lst ):
    res = 0

    while lst != []:
        res = res + 1
        lst = lst.cdr

    return res

def list2array( lst ):
    len = length( lst )
    res = []

    for i in range( len ):
        res[ i ] = lst.car
        lst = lst.cdr

    return res

expected_result = [
   2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31,
   37, 41, 43, 47, 53, 59, 61, 67, 71, 73,
   79, 83, 89, 97 ];

def main( n, arg ):
    s100 = sieve( 100 )
    res = 0
    k = n // 10
    i = 1

    for n in range( n ):
        if (n % k) == 0:
            print( i )
            i = i + 1
        res = sieve( arg )

    return res

def bench_exec( N, arg ):
    bench_time = time.time()
    main( N, arg )
    bench_time = time.time() - bench_time
    print(str(bench_time) + ' seconds: ' + str(N) + ' executions of sieve(' + str(arg) + ')')
    
sys.setrecursionlimit( 3100 )
bench_exec( 2000, 3000 )
