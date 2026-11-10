module.exports=[88982,a=>{"use strict";let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/app/admin/components/SalesOverview.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/app/admin/components/SalesOverview.tsx","default");a.s(["default",0,b])},80605,a=>{"use strict";var b=a.i(88982);a.n(b)},86607,a=>{"use strict";var b=a.i(7997),c=a.i(95936),d=a.i(66879),e=a.i(80605),f=a.i(71679);async function g(){let[a]=await d.f.query(`
    SELECT
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers,
      (SELECT COUNT(*)
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE u.id IS NULL OR u.role <> 'admin') AS orders,
      (SELECT COALESCE(SUM(o.total), 0)
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE u.id IS NULL OR u.role <> 'admin') AS revenue
  `),g=a[0],h=Number(g.products),i=Number(g.customers),j=Number(g.orders),k=Number(g.revenue),l=j>0?k/j:0,[m]=await d.f.query(`
    SELECT DATE(o.created_at) AS sale_date, COALESCE(SUM(o.total), 0) AS revenue
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE (u.id IS NULL OR u.role <> 'admin')
      AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
      AND o.created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
    GROUP BY DATE(o.created_at)
    ORDER BY sale_date ASC
  `),n=m.map(a=>{let b="string"==typeof a.sale_date?a.sale_date.slice(0,10):a.sale_date.toISOString().slice(0,10);return{date:new Date(`${b}T00:00:00Z`).toLocaleDateString("en-US",{month:"short",day:"numeric",timeZone:"UTC"}),revenue:Number(a.revenue)}}),[o]=await d.f.query(`
    SELECT o.id, o.total, COALESCE(u.name, 'Guest') AS customer_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE u.id IS NULL OR u.role <> 'admin'
    ORDER BY o.id DESC
    LIMIT 5
  `),[p]=await d.f.query(`
    SELECT oi.product_id, oi.name,
      SUM(oi.quantity) AS sold,
      SUM(oi.price * oi.quantity) AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    LEFT JOIN users u ON u.id = o.user_id
    WHERE u.id IS NULL OR u.role <> 'admin'
    GROUP BY oi.product_id, oi.name
    ORDER BY sold DESC
    LIMIT 5
  `),q=[{label:"Total revenue",value:(0,f.f)(k)},{label:"Orders",value:j.toLocaleString()},{label:"Customers",value:i.toLocaleString()},{label:"Products",value:h.toLocaleString()},{label:"Average order",value:(0,f.f)(l)}];return(0,b.jsxs)("main",{className:"mx-auto max-w-7xl space-y-8 px-4 py-8",children:[(0,b.jsxs)("div",{className:"flex flex-wrap items-center justify-between gap-4",children:[(0,b.jsx)("h1",{className:"text-2xl font-bold text-gray-900",children:"Dashboard"}),(0,b.jsxs)("div",{className:"flex flex-wrap gap-3",children:[(0,b.jsx)(c.default,{href:"/admin/discounts",className:"inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2",children:"Discounts & Offers"}),(0,b.jsxs)(c.default,{href:"/admin/settings",className:"inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2",children:[(0,b.jsx)("span",{"aria-hidden":"true",children:"⚙"}),"Payments & Delivery Settings"]})]})]}),(0,b.jsxs)("div",{className:"grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2",children:[(0,b.jsxs)("section",{className:"min-w-0",children:[(0,b.jsx)("h2",{className:"mb-4 text-lg font-semibold text-gray-900",children:"Dashboard Statistics"}),(0,b.jsx)("div",{className:"grid grid-cols-2 gap-4",children:q.map(a=>(0,b.jsxs)("div",{className:"flex min-h-28 flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm",children:[(0,b.jsx)("p",{className:"text-sm text-gray-500",children:a.label}),(0,b.jsx)("p",{className:"mt-2 break-words text-xl font-bold text-gray-900",children:a.value})]},a.label))})]}),(0,b.jsx)("section",{className:"min-w-0",children:(0,b.jsx)(e.default,{data:n})})]}),(0,b.jsxs)("div",{className:"grid gap-6 md:grid-cols-2",children:[(0,b.jsxs)("section",{className:"rounded-xl border border-gray-200 bg-white p-4 shadow-sm",children:[(0,b.jsxs)("div",{className:"mb-3 flex items-center justify-between",children:[(0,b.jsx)("h2",{className:"font-semibold text-gray-900",children:"Recent orders"}),(0,b.jsx)(c.default,{href:"/admin/orders",className:"text-sm text-blue-600 hover:underline",children:"View all"})]}),0===o.length?(0,b.jsx)("p",{className:"text-sm text-gray-500",children:"No customer orders yet."}):(0,b.jsx)("ul",{className:"divide-y text-sm",children:o.map(a=>(0,b.jsxs)("li",{className:"flex justify-between gap-3 py-3",children:[(0,b.jsxs)("span",{className:"min-w-0 truncate text-gray-700",children:["#",a.id," · ",a.customer_name]}),(0,b.jsx)("span",{className:"shrink-0 font-medium",children:(0,f.f)(Number(a.total))})]},a.id))})]}),(0,b.jsxs)("section",{className:"rounded-xl border border-gray-200 bg-white p-4 shadow-sm",children:[(0,b.jsx)("h2",{className:"mb-3 font-semibold text-gray-900",children:"Best selling products"}),0===p.length?(0,b.jsx)("p",{className:"text-sm text-gray-500",children:"No sales yet."}):(0,b.jsx)("ul",{className:"divide-y text-sm",children:p.map(a=>(0,b.jsxs)("li",{className:"flex justify-between gap-3 py-3",children:[(0,b.jsxs)("span",{className:"min-w-0 truncate text-gray-700",children:[a.name," × ",Number(a.sold)]}),(0,b.jsx)("span",{className:"shrink-0 font-medium",children:(0,f.f)(Number(a.revenue))})]},a.product_id))})]})]}),(0,b.jsxs)("section",{className:"space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm",children:[(0,b.jsx)("h2",{className:"text-base font-semibold text-gray-900",children:"Store management"}),(0,b.jsx)("div",{className:"flex flex-wrap gap-3",children:[{label:"Add product",href:"/admin/products/new",primary:!0},{label:"Manage products",href:"/admin/products"},{label:"Customer orders",href:"/admin/orders"},{label:"Customers",href:"/admin/customers"},{label:"Categories",href:"/admin/categories"},{label:"Inventory",href:"/admin/inventory"},{label:"Discounts",href:"/admin/discounts"},{label:"Reviews",href:"/admin/reviews"},{label:"Reports",href:"/admin/reports"},{label:"Store settings",href:"/admin/settings"},{label:"Homepage Slides",href:"/admin/slides"}].map(a=>(0,b.jsx)(c.default,{href:a.href,className:a.primary?"rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800":"rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-50",children:a.label},a.href))})]})]})}a.s(["default",0,g,"dynamic",0,"force-dynamic"])},17222,function(a){a.n(a.i(86607))}];

//# sourceMappingURL=app_admin_065tsy8mw1wf2._.js.map