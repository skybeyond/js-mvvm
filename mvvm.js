class MVVM {
    constructor(options) {
        this.$el = options.el
        this.$data = options.data
        
        if(this.$el) {

            new Observe(this.$data)
            


            new Compile(this.$el,this)
        }
    }
}