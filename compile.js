class Compile{
    constructor (el,vm) {
        this.el = this.isElementNode(el)?el:document.querySelector(el)
        this.vm = vm
        if (this.el) {
            let fragment = this.node2framgment(this.el)
            this.compile(fragment)
            
            this.el.appendChild(fragment)
            
        }
    }

    isElementNode(node) {
        return node.nodeType === 1
    }

    node2framgment(el) {
           
        let fragment = document.createDocumentFragment()

        let firstChild

        while (firstChild = el.firstChild) {
            
            fragment.appendChild(firstChild)
            
        }
        return fragment
    }

    compile(fragment){
        let childNodes = fragment.childNodes 
        
        Array.from(childNodes).forEach(node=>{
            console.log(node, this.isElementNode(node))
            if(this.isElementNode(node)){
                this.compileElement(node)
                this.compile(node)
            }else{
                this.compileText(node)
            }

        })
    }

    compileElement(node){
        
        let attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            let attrName = attr.name
            // 判断属性名是否包含 v-指令
            if(this.isDirective(attrName)) {
                // 取到v-指令属性中的值（这个就是对应data中的key）
                let expr = attr.value
                // 获取指令类型
                let [,type] = attrName.split('-')
                // node vm.$data expr
                compileUtil[type](node, this.vm, expr)
            }
        })
    }

      // 是不是指令
    isDirective(name) {
        return name.includes('v-')
    }

     // 这里需要编译文本
    compileText(node) {
    
        //取文本节点中的文本
       
        
        let expr = node.textContent
        let reg = /\{\{([^}]+)\}\}/g
        if(reg.test(expr)) {
        // node this.vm.$data text
            compileUtil['text'](node, this.vm, expr)
        }
    }
}

// 解析不同指令或者文本编译集合
const compileUtil = {
    text(node, vm, expr) { // 文本
        console.log(expr,'111111111111111')
        
      let updater = this.updaterall['textUpdate']
      
      updater && updater(node, getTextValue(vm, expr))
      console.log(vm,expr,33333333333333)
      // 这里加一个监控 数据变化了 应该调用这个watcher的callback
      //let exprs = expr.replace(/\{\{([^}]+)\}\}/g,'$1');  //这里需要转换成message 才能获得监听
      new Watcher(vm, expr, (newValue) => {
        // 当值变化后 会调用cb ，将新值传递过来
        updater && updater(node, newValue)
        
      })
      
    },
    model(node, vm, expr){ // 输入框
        let updater = this.updaterall['modelUpdate']
        updater && updater(node, getValue(vm, expr))
        // 这里加一个监控 数据变化了 应该调用这个watcher的callback
        new Watcher(vm, expr, (newValue) => {
            // 当值变化后 会调用cb ，将新值传递过来
            updater && updater(node, newValue)
        })
        
        node.addEventListener('input', (e) => {
          let newValue = e.target.value
          setValue(vm, expr,newValue)
        })
        
        //updater && updater(node, getValue(vm, expr))
    },
    // 更新函数
    updaterall: {
      // 文本赋值
      textUpdate(node, value) {
        node.textContent = value
      },
      // 输入框value赋值
      modelUpdate(node, value) {
        node.value = value
      }
    }
  }
  // 辅助工具函数
  // 绑定key上对应的值，从vm.$data中取到
  const getValue = (vm, expr) => {
    
    expr = expr.split('.') // [message, a, b, c]
    return expr.reduce((prev, next) => {
      return prev[next]
    }, vm.$data)
  }

  const setValue = (vm, exp, value) => {
    let val = vm.$data;
    exps = exp.split('.');
    exps.forEach((key, index) => {
      key = key.trim();
      if (index < exps.length - 1) {
        val = val[key];
      }
      else {
        val[key] = value;
      }
    });
  }


  // 获取文本编译后的对应的数据
  const getTextValue = (vm, expr) => {
    return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
      return getValue(vm, arguments[1])
    })
  }