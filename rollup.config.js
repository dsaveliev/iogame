import buble from 'rollup-plugin-buble';

export default {
    entry: 'public/index.js',
    dest: 'public/build/bundle.js',
    format: 'iife',
    plugins: [buble()],
    sourceMap: true
};
