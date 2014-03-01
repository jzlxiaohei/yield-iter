+function(exports,undefined){
	
	function iter(arr){
		return new Iterator(arr);
	}
	
	function* wrap(arr){
		for(var i =0;i<arr.length;i++){
				yield arr[i];
		}
	}
	//map,where,concat,take
	//sort,groupby
	//reduce,max,min,sum,avg,stat

	function Iterator(arr){
		this.gen = wrap(arr);
	}
	
	Iterator.prototype = {
		where:where,
		map:map,
		concat:concat,
		take:take,
		groupBy:groupBy,
		sort:sort,
		
		max:max,
		min:min,
		avg:avg,
		sum:sum,
		count:count,
		stat:stat,
		reduce:reduce,
		
		toArray:toArray,
	}
	
	
	function* mapImpl(gen,f){
		var _g;
		while(true){
			_g =gen.next();
			if(_g.done) break;
			yield f(_g.value);
		}
	}
		
	/*
	 * map (T,index) -> U
	 * 
	 * @param {generator} gen
	 * @f {Function} f : (T,index)->U
	 * @api private
	 */
	function map(f){
		var gen = mapImpl(this.gen,f);
		this.gen =gen;
		return this;
	}
	
	
	function* whereImple(gen,f){
		var index = 0, _g,done,value;
		while(true){
			_g = gen.next();
			if(_g.done) break;
			value = _g.value;
			if(f(value,index++)){
				yield value;
			}
		}
	}
	
	//@param {Funciton} f: filter function,(T,index)->boolean
	function where(f){
		var gen = whereImple(this.gen,f);
		this.gen = gen;
		return this;
	}
	
	
	function* concatImpl(gen,otherArr,f){
		var f = f||defaultConcat;
		var index = 0, _g;
		while(true){
			_g = gen.next();			
			if(_g.done) break;
			yield _g.value;
		}
		for(var i=0;i<otherArr.length;i++){
			yield otherArr[i];
		}
	}
	
	//@param {Funciton} f: how concat two values,(T,U)->V
	function concat(arr,f){
		//var f = f||defaultConcat;
		var gen = concatImpl(this.gen,arr,f);
		this.gen = gen;
		return this;
	}
	
	//n should be number
	function* takeImpl(gen,n){
		var _g,index=0;
		while(true){
			_g = gen.next();			
			if(_g.done || (index++)>=n ) break;
			yield _g.value;
		}
	}
	
	function take(n){
		this.gen = takeImpl(this.gen,n);
		return this;
	}
	
	
	function reduce(f,initValue){
		var gen = this.gen
		var	_g;
		if(initValue==undefined){
			_g=gen.next();
			if(_g.done) {
				return undefined
			}
			else{
				initValue = _g.value;
			}
		}
		
		var result=initValue;
		
		while(true){
			_g = gen.next();
			if(_g.done) break;
			result = f(result,_g.value);
		}
		return result;
	}
	
	function* groupByImpl(gen,key){
		var getKey = (typeof key =='function')?key:createKey(key);
		var group={};
		var _g,_k,value;
		while(true){
			_g = gen.next();
			if(_g.done) break;
			value = _g.value;
			_k = getKey(value);
			group[_k]
			if(_k in group){
				group[_k].push(value)
			}else{
				group[_k]=[];
				group[_k].push(value);
			}
		}
		for(var k in group){
			yield {'key':k,'values':group[k]};
		}
	}
	//@param ,{String|Function}key
	function groupBy(key){
		this.gen  = groupByImpl(this.gen,key);
		return this;
	}
	
	function* sortImpl(gen,f){
		f=f||defaultSort;
		var arr = toArrayImpl(gen).sort(f);
		for(var i=0;i<arr.length;i++){
			yield arr[i];
		}
	}
	function sort(f){
		this.gen = sortImpl(this.gen,f);
		return this;
	}
	
	
	function sum(){
		var self =this;
		return reduce.call(self,function(v1,v2){
						return v1+v2
						},0);
	}
	
	function min(f){
		f=f||defaultMin;
		var self =this;
		return reduce.call(self,f);	
	}
	function max(f){
		f=f||defaultMax;
		var self =this;
		return reduce.call(self,f);	
	}
	function count(){
		var gen = this.gen;
		var count=0;
		var _g;
		while(true){
			_g = gen.next();
			if(_g.done) break;
			count++;
		}
		return count;
	}
	//just for numbers;
	function avg(){
		var gen = this.gen;
		var sum=0,count=0,_g;
		while(true){
			_g = gen.next();
			if(_g.done) break;
			sum+=_g.value;
			count++;
		}
		return sum/count;
	}
	//just for numbers
	function stat(){
		var gen = this.gen;
		var _g,value;
		var count=0;
		var sum = 0;
		var max =Number.MIN_VALUE;
		var min = Number.MAX_VALUE;
		while(true){
			_g = gen.next();
			if(_g.done) break;
			value = _g.value;
			sum+=value;;
			count++;
			if(max<value)max=value;
			if(min>value)min = value;
		}
		var avg = sum/count;
		return {
			min:min,
			max:max,
			sum:sum,
			avg:avg,
			count:count
		};
	}
	
	
	
	function toArrayImpl(gen){
		var arr = [];
		var _g;
		while (true){
			_g=gen.next();
			if(_g.done)break;
			arr.push(_g.value);
		};
		return arr;
	}
	
	function toArray(){
		var gen = this.gen;
		return toArrayImpl(gen);
	}
	
	//--------------------------------------
	//default function for some functionality
	//--------------------------------------
	//default function for concat
	function defaultConcat(va1,va2){
		return (va1 + va2);
	}
	function defaultMin(v1,v2){
		return (v1<v2)?v1:v2;
	}
	function defaultMax(v1,v2){
		return (v1>v2)?v1:v2;
	}
	
	function defaultSort(v1,v2){
		if(v1>v2)return 1;
		if(v1<v2)return -1;
		return 0;
	}
	function createKey(key){
		return function(value){
			return value[key];
		}
	}
	
	exports.iter = iter;
}(window)
