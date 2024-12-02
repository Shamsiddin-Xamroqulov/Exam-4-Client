const elProductsList = document.querySelector(".js-products-list");
const elProductsTemp = document.querySelector(".js-store-temp").content;
const elLogOutBtn = document.querySelector(".js-log-out-btn");
const saveProduct = getItem("save") ? JSON.parse(getItem("save")) : [];
const elProductInfoModal = document.querySelector(".js-product-modal");
const elFullPriceTitle = document.querySelector(".js-full-price");
const elSaveProductLink = document.querySelector(".js-save-product-link");
const elBasketProductLink = document.querySelector(".js-basket-product-link");

const handleGetOrderFn = async () => {
    try {
        const req = await fetch(BASE_URL + "order", {
            method: "GET",
            headers: {
                authorization: getItem("token")
            }
        });
        if (req.ok) {
            const res = await req.json();
            return res
        }
    } catch (error) {
        console.log(error.message);
    }
}

const order_product = handleGetOrderFn();

const handleFullPriceFn = async (order) => {
    order = (await order)
    if (order?.length) {
        let full_price = order.reduce((acc, {product_price}) => acc += (+product_price), 0);
        elFullPriceTitle.textContent = "Jami summa: " + full_price + " so'm"
    };
    if (!(order?.length)) elFullPriceTitle.textContent = "Hali harid qilishni boshlamagansiz ";
};
handleFullPriceFn(order_product);

const handleGetProductFn = async () => {
    try {
        const req = await fetch(BASE_URL + "product", {
            method: "GET",
            headers: {
                authorization: getItem("token")
            }
        });
        if (req.ok) {
            const res = await req.json();
            return res
        }
    } catch (error) {
        console.log(error);
    }
}
let products = handleGetProductFn();

const handleBageNumberCheckFn = async () => (saveProduct.length) ? elSaveProductLink.textContent = "Saved Producs: " + saveProduct.length : elSaveProductLink.textContent = "Saved Producs";
handleBageNumberCheckFn();


const handleRenderOrders = async product => {
    product = (await product);
    console.log(product);
    elProductsList.innerHTML = "";
    const dockFragment = document.createDocumentFragment();
    product.forEach(({ product_name, product_price, product_id }) => {
        const clone = elProductsTemp.cloneNode(true);
        clone.querySelector(".js-product-name").textContent = (product_name.split(" ").length > 3 ? product_name.split(" ").slice(0, 4).join(" ") + " ..." : product_name);
        clone.querySelector(".js-product-price").textContent = product_price + " so'm";
        const elSaveProductBtn = clone.querySelector(".js-save-product-btn");
        elSaveProductBtn.dataset.id = product_id;
        const checkProduct = saveProduct.some(({ id }) => id == elSaveProductBtn.dataset.id);
        if (checkProduct) elSaveProductBtn.innerHTML = `<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="js-save-product-icon store-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"></path></svg>`;
        if (!checkProduct) elSaveProductBtn.innerHTML = `<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="js-save-product-icon store-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"></path></svg>`;
        elSaveProductBtn.querySelector(".js-save-product-icon").dataset.id = product_id;
        const elAddBasketProductBtn = clone.querySelector(".js-add-basket-product-btn");
        elAddBasketProductBtn.dataset.id = product_id;
        elAddBasketProductBtn.querySelector(".js-add-basket-product-btn-icon").dataset.id = product_id;
        const elProductInfoBtn = clone.querySelector(".js-product-info-btn");
        elProductInfoBtn.dataset.id = product_id;
        elProductInfoBtn.querySelector(".js-product-info-btn-icon").dataset.id = product_id;
        dockFragment.append(clone);
    });
    elProductsList.append(dockFragment);
}
handleRenderOrders(order_product);

elLogOutBtn.addEventListener("click", () => {
    removeItem("token");
    window.location = "/index.html"
});

elProductsList.addEventListener("click", async evt => {
    const evt_target = evt.target;
    const datasetId = evt_target.dataset.id;
    if (evt_target.matches(".js-save-product-btn") || evt_target.matches(".js-save-product-icon")) {
        if (datasetId) {
            const checkProduct = saveProduct.findIndex(({ id }) => id == datasetId);
            const findIndexProduct = (await products).findIndex(({ id }) => id == datasetId);
            if (checkProduct != (-1)) {
                saveProduct.splice(checkProduct, 1);
                setItem("save", saveProduct);
            };
            if (checkProduct == (-1)) {
                if (findIndexProduct + 1) {
                    saveProduct.push((await products)[findIndexProduct]);
                    setItem("save", saveProduct);
                }
            };
            await handleRenderOrders(order_product);
            await handleBageNumberCheckFn()
            return
        }
    };
    // 
    if (evt_target.matches(".js-product-info-btn") || evt_target.matches(".js-product-info-btn-icon")) {
        const findProduct = (await products).find(({ id }) => id == datasetId);
        if (findProduct) {
            elProductInfoModal.querySelector(".js-modal-product-img").src = BASE_URL + findProduct.product_img;
            const elProductNameInp = elProductInfoModal.querySelector(".js-product-name-inp");
            elProductNameInp.value = findProduct.product_name;
            const elProductPriceInp = elProductInfoModal.querySelector(".js-product-price-inp");
            elProductPriceInp.value = findProduct.product_price + " so'm";
            const elProductDescriptionTextarea = elProductInfoModal.querySelector(".js-product-description-area");
            elProductDescriptionTextarea.value = findProduct.product_desc;
            return
        }
    }
    if (evt_target.matches(".js-add-basket-product-btn") || evt_target.matches(".js-add-basket-product-btn-icon")) {
        try {
            const check_order_praduct = (await order_product).find(({ product_id }) => product_id == datasetId);
            if (check_order_praduct) {
                const req = await fetch(BASE_URL + "order/" + check_order_praduct.order_id, {
                    method: "DELETE",
                    headers: {
                        authorization: getItem("token")
                    },
                });
                if (req.ok) {
                    window.location.replace("/basket/index.html")
                    // const order = await handleGetOrderFn();
                    // await handleRenderOrders(order);
                }
            };
            return;
        } catch (error) {
            console.log(error);
        }
    }
});