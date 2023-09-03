// API 方法 - 过滤字段、根据字段排序、限制返回的字段、分页

export default class APIFeatures {
    query: any; // ts 类型问题，暂时无法解决，any 关闭检查
    queryString: any // ts 类型问题，暂时无法解决，any 关闭检查

    constructor(query: any, queryString: any) {
        this.query = query;
        this.queryString = queryString
    }

    // 根据查询字符串过滤
    filter() {
        // 1. 初步过滤：过滤不属于字段查询的查询字符串
        const queries = {...this.queryString}; // 请求中携带的所有查询字符串的浅拷贝
        const excludedQueries = ['page', 'sort', 'limit', 'fields']; // 要排除的查询字符串
        excludedQueries.forEach(item => delete queries[item]); // 排除后的查询字符串 - 用于数据库查询

        // 2. 高级过滤：如果存在范围，则使用范围查询
        let queryString = JSON.stringify(queries);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryString));

        return this
    }

    // 根据字段排序，支持多字段排序
    sort() {
        if (this.queryString.sort) {
            // 对 sort 进行清洗，如果存在多个排序字段，则需要对 sort 的值进行替换
            let sortString = this.queryString.sort as string; // 类型断言：sort 必为 string 类型
            sortString = sortString.split(',').join(' ');

            this.query = this.query.sort(sortString);
        } else {
            this.query = this.query.sort("-createdAt");
        }

        return this
    } 

    // 限制返回的查询字段
    limitFields() {
        if (this.queryString.fields) {
            let fields = this.queryString.fields as string;
            fields = fields.split(',').join(' ');

            this.query = this.query.select(fields) as any; // ts 类型问题，暂时无法解决，使用 any 关闭类型检查
        } else {
            this.query = this.query.select('-__v') as any; // 不传输默认的 __v 属性
        }

        return this
    }

    // 分页
    paginate() {
        const page = this.queryString.page ? Number(this.queryString.page) : 1 // 默认为1
        const limit = this.queryString.limit ? Number(this.queryString.limit) : 10 // 默认为 10
        const skip = (page - 1) * limit // 跳过的文档数

        this.query = this.query.skip(skip).limit(limit);

        return this
    }
}