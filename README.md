#yield iteration
a demo to show how to use new js keywork `yield` to write a iteration lib to manipulate colloection (array).Your env should support ES6(harmony).

---
##feature
1. chainable: like
	 	
		iter(arr)
			.where(...)
			.map(..)
			.sort(..)
			.where()
			.groupBy(..)
2. use GeneratorFunction,for most cases just iterate Array once(see more details in API section)

##Files:
just write some demo,so the dir structure is simple

`iter.js` : lib for iteration

`assert.js`: provide some `assert*` functions to help test

`test.html` some test/example for the lib, pls read the source code.If your browser supports ES6(harmony),just open this file,to see test result
	

##example:


	var books = [{'name':'js1','category':'js','price':10}
					,{'name':'js2','category':'js','price':20}
					,{'name':'js3','category':'js','price':30}
					,{'name':'js4','category':'js','price':40}
					,{'name':'node1','category':'node','price':50}
					,{'name':'node2','category':'node','price':60}
					,{'name':'node3','category':'node','price':70}
					,{'name':'other1','category':'other','price':80}
					,{'name':'other2','category':'other','price':90}]

	//group by category,then find which ones contains more than 3(included) books
	//after call groupBy，the data in the seq becomes {key:..,values:...}
	//values is an array ，contains all data belongs to its category
 
	var arr = iter(books)
				.groupBy('category')
				.where(function(v){return v.values.length>=3})
				.toArray();

	/*arr=[ {key:'js' , values:[{name:'js1'.....}, ...] }
				 {key:'node' , values:[{name:'node1'.....},...]
	]*/




##API

函数主要分为三大类：

- 1.`where,map,take,concat`:这些函数可以进行任意的链式调用，而且不会对原序列进行求值，直到使用toArray方法
- 2.`sort,groupBy`: 这些函数的用法同第一类一样，调用之后可以继续进行链式调用，但是调用这些方法会进行立即求值。从使用的角度，第一类很第二类没有区别
- 3.`max,min,sum,avg,count,reduce,stat`,聚合函数，会把序列变成一个值返回，执行其中的任意方法都会接受调用链，并进行立即求值，其中avg主要针对元素是number数组，其他类型的结果可能会比较怪异，从效果上，出来数字sum支持字符串的拼接。

---
`iter(arr)` : {arr:Array}。 传入一个数组，该函数会对函数进行包装，返回一个GeneratorFunction(以下简称 **`GF`** ),此为入口函数，进行本lib时，应首先使用该函数。

`toArray()` : 对`GF`进行立即求值，返回相应数组，除聚合函数，此方法是唯一出口函数
	
`where(f)` ： {f:Function，f应返回一个boolean值}。传入一个函数，用作过滤条件。下面的代码，将返回1到10中的偶数
	
			var _1to10 = [1,2,3,4,5,6,7,8,9,10];
			var arr = iter(_1to10)
					.where(function(v){return v%2==0})
					.toArray();

---

`map(f)` :{f:Function}。把序列中的每个值，通过f进行映射。下面的代码，取得偶数后，对其进行乘以2的处理，因此返回[4,8,12,16,20]
			
			var arr = iter(_1to10)
						.where(function(v){return v%2==0})
						.map(function(v){return 2*v})
						.toArray();

---

`take(n)`:{n:num}。选取序列的前n个。
			
			var arr = iter(_1to10)
						.take(5)
						.toArray();
			//arr:[1,2,3,4,5];

---

`sort(f)`:{f:Function,可选}。sort会对原序列进行立即迭代，把排序之后的结果，作为新序列支持后续的链式调用
			
			var src = [2,5,6,8,1,4,9,10,7,3];
			var arr= iter(src)
						.sort()
						.map(function(v){return v*2})
						.toArray();
			//arr：[2,4,6,8,10,12,14,16,18,20]
			

			var person = [{first:'god',second:'pig',age:25,male:'m'},
						{first:'wang',second:'er',age:26,male:'m'},
						{first:'zhang',second:'san',age:18,male:'m'},
						{first:'li',second:'si',age:19,male:'m'},
						{first:'god',second:'pig',age:21,male:'m'},
						{first:'god',second:'cat',age:22,male:'m'}];
			var arr= iter(person)
						.sort(function(v1,v2){return v1.age-v2.age})
						.toArray();
			//arr:[{..age:18..} , ... , {..age:26}...]

`groupBy(f)` :{f:String|Function},如果是String，根据这个字符出去序列中索引对象的属性，作为Key，如果是Function,按照f的返回值作为Key。groupBy后，序列中的每一个对象将变成`{key:.. , values:[...]}`,groupBy后依然可以链式调用（见example),但是对象格式变化后，需要小心处理。

			//person的定义见sort部分
			//下面的函数,使用first和second的组合做为Key，这样会有序列中会有5个对象，其中key：'god pig' 下的values数组有2个元素，其他都只有一个元素
			var arr=iter(person)
						.groupBy(function(v){return v.first+' '+v.second})
						.toArray();

---
			
`max,min,sum,avg,count`:聚和函数，调用之后不能再进行链式调用
			
			iter(_1to10).sum();//55，功能上讲，还支持字符串的拼接
			iter(_1to10).avg();//1，应该针对数组元素为number的情况进行调用
			iter(_1to10).min();//1
			iter(_1to10).max();//10
			iter(_1to10).count();//1

 	其中，min和max还可以接受一个函数，用于自定义大小规则
			//谁年龄小返回谁			
			var f1 = function(v1,v2){
				return v1.age<v2.age?v1:v2
			}
			//谁年龄大返回谁	
			var f2 = function(v1,v2){
				return v1.age>v2.age?v1:v2
			}
			var pMin = iter(person).min(f1);
			var pMax = iter(person).max(f2);
			//pMin.age:18,pMax.age:26

---

`state` 针对number数组，功能相当于上面5个聚会函数之和，但是仅迭代一次
		var obj = iter(_1to10).stat();
		//obj : {min: 1, max: 10, sum: 55, avg: 5.5, count: 10} 

---
`reduce(f,initValue)`
		
		//阶乘1*2*3*4*5
			var scalarV = iter(_1to10)
						.take(5)
						.reduce(function(v1,v2){return v1*v2},1);
			zl.assert(scalarV==120,'reduce pass');
			