const minimum_part_size = 0;


function compact_paths(paths) {
    let split_paths = paths.map(path => path.split('/'));
    let tree = compact_tree(split_paths);
    return split_paths.map(split_path => compact_path(split_path, tree))
}

function compact_path(split_path, tree) {
    if (tree.size == 0 || split_path.length <= 1)
        return split_path.join('/');
    else {
        let x = tree.get(split_path[0]);
        let c = x[0];
        return (c.length == 0 ? '' : c+'/') +
               compact_path(split_path.slice(1), x[1]);
    }
}

function compact_tree(split_paths) {
    let m = new Map();
    for (let i in split_paths) {
        let split_path = split_paths[i];
        let n = split_path.length;
        if (n >= 2) {
            let head = split_path[0];
            if (m.has(head))
                m.get(head)[1].push(split_path.slice(1));
            else
                m.set(head,[head,[split_path.slice(1)]]);
        }
    }
    let n = minimum_part_size;
    while (true) {
        let unique = new Map();
        for (let k of m.keys()) unique.set(k.slice(0,n), true);
        if (unique.size == m.size)
            break;
        n++;
    }
    for (let x of m.values()) {
        x[0] = x[0].slice(0,n);
        x[1] = compact_tree(x[1]);
    }
    return m;
}

/*

console.log(
    compact_paths(['gambit/r5rs/ack',
                   'gambit/r5rs/fib',
                   'gambit/r6rs/ack',
                   'gambit/r6rs/fib'])
);


when minimum_part_size==0 this prints:
  ['r5/ack',
   'r5/fib',
   'r6/ack',
   'r6/fib']

when minimum_part_size==1 this prints:
  ['g/r5/ack',
   'g/r5/fib',
   'g/r6/ack',
   'g/r6/fib']

*/

module.exports.compact_paths = compact_paths;