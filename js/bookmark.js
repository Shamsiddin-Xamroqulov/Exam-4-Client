const elProductsList = document.querySelector(".js-products-list");
const elProductsTemp = document.querySelector(".js-store-temp").content;
const elLogOutBtn = document.querySelector(".js-log-out-btn");
const saveProduct = getItem("save") ? JSON.parse(getItem("save")) : [];
const elProductInfoModal = document.querySelector(".js-product-modal");
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

let order_product = handleGetOrderFn();

const handleBageNumberCheckFn = async () => (await order_product).length ? elBasketProductLink.textContent = "Store Basket: " + (await order_product).length : elBasketProductLink.textContent = "Store Basket"; handleBageNumberCheckFn();

const handleRenderProducts = async product => {
    elProductsList.innerHTML = "";
    if (!(product.length)) return;
    if (product.length) {
        order_product = (await order_product);
        const dockFragment = document.createDocumentFragment();
        product.forEach(({ product_name, product_desc, product_img, product_price, id }) => {
            const clone = elProductsTemp.cloneNode(true);
            clone.querySelector(".js-product-img").src = BASE_URL + product_img;
            clone.querySelector(".js-product-name").textContent = (product_name.split(" ").length > 3 ? product_name.split(" ").slice(0, 4).join(" ") + " ..." : product_name);
            clone.querySelector(".js-product-description").textContent = (product_desc.split(" ").length > 3 ? product_desc.split(" ").slice(0, 4).join(" ") + " ..." : product_desc);
            clone.querySelector(".js-product-price").textContent = product_price + " so'm";
            const elSaveProductBtn = clone.querySelector(".js-delete-save-product-btn");
            elSaveProductBtn.dataset.id = id;
            elSaveProductBtn.querySelector(".js-delete-save-product-icon").dataset.id = id;
            // 
            const elAddBasketProductBtn = clone.querySelector(".js-add-basket-product-btn");
            elAddBasketProductBtn.dataset.id = id;
            const check_order_praduct = order_product.some(({ product_id }) => product_id == elAddBasketProductBtn.dataset.id);
            if (check_order_praduct) elAddBasketProductBtn.innerHTML = `<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="store-icon js-add-basket-product-btn-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path></svg>`;
            if (!check_order_praduct) elAddBasketProductBtn.innerHTML = `<svg data-slot="icon" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="store-icon js-add-basket-product-btn-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"></path></svg>`;
            // 
            elAddBasketProductBtn.querySelector(".js-add-basket-product-btn-icon").dataset.id = id;
            const elProductInfoBtn = clone.querySelector(".js-product-info-btn");
            elProductInfoBtn.dataset.id = id;
            elProductInfoBtn.querySelector(".js-product-info-btn-icon").dataset.id = id;
            dockFragment.append(clone);
        });
        elProductsList.append(dockFragment);
    };
};
handleRenderProducts(saveProduct);


elLogOutBtn.addEventListener("click", () => {
    removeItem("token");
    window.location = "/index.html"
});
elProductsList.addEventListener("click", async evt => {
    const evt_target = evt.target;
    const datasetId = evt_target.dataset.id;
    if (evt_target.matches(".js-delete-save-product-btn") || evt_target.matches(".js-delete-save-product-icon")) {
        if (datasetId) {
            const checkProduct = saveProduct.findIndex(({ id }) => id == datasetId);
            if (checkProduct != (-1)) {
                saveProduct.splice(checkProduct, 1);
                setItem("save", saveProduct);
            };
            handleRenderProducts(saveProduct);
            return
        }
    };
    // 
    if (evt_target.matches(".js-product-info-btn") || evt_target.matches(".js-product-info-btn-icon")) {
        const findProduct = saveProduct.find(({ id }) => id == datasetId);
        if (findProduct) {
            elProductInfoModal.querySelector(".js-modal-product-img").src = findProduct.product_img;
            const elProductNameInp = elProductInfoModal.querySelector(".js-product-name-inp");
            elProductNameInp.value = findProduct.product_name;
            const elProductPriceInp = elProductInfoModal.querySelector(".js-product-price-inp");
            elProductPriceInp.value = findProduct.product_price + " so'm";
            const elProductDescriptionTextarea = elProductInfoModal.querySelector(".js-product-description-area");
            elProductDescriptionTextarea.value = findProduct.product_desc;
            return
        }
    }
    // 
    if (evt_target.matches(".js-add-basket-product-btn") || evt_target.matches(".js-add-basket-product-btn-icon")) {
        try {
            const req = await fetch(BASE_URL + "order", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    authorization: getItem("token")
                },
                body: JSON.stringify({ product_id: datasetId })
            });
            if (req.ok) {

            }
        } catch (error) {
            console.log(error);
        }
    }
    // 
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
                    await handleGetOrderFn()
                    await handleBageNumberCheckFn();
                    await handleRenderProducts(saveProduct);
                }
            };
            if (!check_order_praduct) {
                const req = await fetch(BASE_URL + "order", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        authorization: getItem("token")
                    },
                    body: JSON.stringify({ product_id: datasetId })
                });
                if (req.ok) {
                    await handleGetOrderFn();
                    await handleBageNumberCheckFn();
                    await handleRenderProducts(saveProduct);
                };
            };
            return;
        } catch (error) {
            console.log(error);
        }
    }
});

// 439
// fetch("http://localhost:5600/order/439", {method:"DELETE", headers: {authorization: getItem("token")}}).then(res => console.log(res.json()));