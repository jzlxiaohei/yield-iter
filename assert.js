( function(exports,undefined){
        
        
        function assert(exp,msg,parentNode){
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(msg));
                if(!parentNode)parentNode = document.getElementsByTagName("body")[0];
                if(exp)
                        li.style.color = "green";
                else
                {
                        li.style.color = "red";
                        li.style.textDecoration = "line-through";
                        li.style.fontSize= "1.2em";
                        li.style.fontWeight = "bold";
                }
                parentNode.appendChild(li);
        }
        if(!exports.zl) exports.zl = {};
		var zl = exports.zl= exports.zl||{};
        
        
        
        zl.assertAlmostEqual = function(source,target,msg,epsilon){
                epsilon = epsilon || 1e-6;
                assert(Math.abs(source - target)<=epsilon,msg);
        };
        
        zl.assert = assert;
		
		zl.assertArr=function(sArr,tArr,msg){
			var right = sArr.length==tArr.length;
			for(var i =0;i<sArr.length;i++){
				if(sArr[i]!=tArr[i]){
					right=false;
					break;
				}
			}
			assert(right,msg);
		}
		
		
})(window)