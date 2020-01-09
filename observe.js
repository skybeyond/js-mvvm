//劫持数据
class Observe{
    constructor(data){
        this.observe(data)
    }

    // 把data数据原有的属性改成 get 和 set方法的形式
    observe(data) {
        if(!data || typeof data!== 'object') {
            return
        }
        
        // 将数据一一劫持
        // 先获取到data的key和value
        Object.keys(data).forEach((key) => {
            // 数据劫持
            this.defineReactive(data, key, data[key])
            this.observe(data[key]) // 深度递归劫持，保证子属性的值也会被劫持
        })
    }

    // 定义响应式
    defineReactive(obj, key, value) {
        let _this = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() { // 当取值时调用
                
                Dep.target && dep.addSub(Dep.target); //Dep.target = watcher 这个存在的时候，添加到可观察对象数组中
                console.log(dep.subs)
                return value
            },
            set(newValue) { //当data属性中设置新值得时候 更改获取的新值
                if(newValue !== value) {
                    _this.observe(newValue) // 如果是对象继续劫持
                    console.log('监听到值变化了,旧值：', value, ' --> 新值：', newValue);
                    value = newValue
                    dep.notify()
                }
            }
        })
    }
}

// 消息订阅器Dep()
class Dep {
    constructor() {
      // 订阅的数组
      this.subs = []
    }
    addSub(watcher) {
      // push到订阅数组
      this.subs.push(watcher)
    }
    notify() {
      // 通知订阅者，并执行订阅者的update回调
      this.subs.forEach(watcher => watcher.update())
    }
}