const elProductsList = document.querySelector(".js-products-list");
const elProductsTemp = document.querySelector(".js-store-temp").content;
const elLogOutBtn = document.querySelector(".js-log-out-btn");
const saveProduct = getItem("save") ? JSON.parse(getItem("save")) : [];
const elProductEditModal = document.querySelector(".js-product-modal");
const elProductEditModalForm = elProductEditModal.querySelector(".js-modal-form")
const elProductEditNameInp = elProductEditModalForm.querySelector(".js-product-name-inp");
const elProductEditImgInp = elProductEditModalForm.querySelector(".js-product-img-inp");
const elProductEditPriceInp = elProductEditModalForm.querySelector(".js-product-price-inp");
const elProductEditDescriptionTextarea = elProductEditModalForm.querySelector(".js-product-description-area");
const elSaveProductLink = document.querySelector(".js-save-product-link");
const elBasketProductLink = document.querySelector(".js-basket-product-link");
const elErrorAlert = document.querySelector(".js-error-alert");
const elBtnOk = elErrorAlert.querySelector(".js-btn-ok");
const elAddProductForm = document.querySelector(".js-add-product-form");
const elProductNameInp = elAddProductForm.querySelector(".js-product-name-inp");
const elProductImgInp = elAddProductForm.querySelector(".js-product-img-inp");
const elProductPriceInp = elAddProductForm.querySelector(".js-product-price-inp");
const elProductDescriptionTextarea = elAddProductForm.querySelector(".js-product-description-area");

const handleBageNumberCheckFn = () => {
    (saveProduct.length) ? elSaveProductLink.textContent = "Saved Producs: " + saveProduct.length : elSaveProductLink.textContent = "Saved Producs";
}
handleBageNumberCheckFn();

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

const handleRenderProducts = async product => {
    product = (await product);
    elProductsList.innerHTML = "";
    const dockFragment = document.createDocumentFragment();
    product.forEach(({ product_name, product_desc, product_img, product_price, id }) => {
        const clone = elProductsTemp.cloneNode(true);
        clone.querySelector(".js-product-img").src = BASE_URL + product_img;
        clone.querySelector(".js-product-name").textContent = (product_name.split(" ").length > 3 ? product_name.split(" ").slice(0, 4).join(" ") + " ..." : product_name);
        clone.querySelector(".js-product-description").textContent = (product_desc.split(" ").length > 3 ? product_desc.split(" ").slice(0, 4).join(" ") + " ..." : product_desc);
        clone.querySelector(".js-product-price").textContent = product_price + " so'm";
        const elDeleteProductBtn = clone.querySelector(".js-delete-product-btn");
        elDeleteProductBtn.dataset.id = id;
        elDeleteProductBtn.querySelector(".js-delete-product-icon").dataset.id = id;
        const elEditProductBtn = clone.querySelector(".js-edit-product-btn");
        elEditProductBtn.dataset.id = id;
        elEditProductBtn.querySelector(".js-edit-product-icon").dataset.id = id;
        dockFragment.append(clone);
    });
    elProductsList.append(dockFragment);
}
handleRenderProducts(products);


const handleInputChangeAndBlur = evt => {
    try {
        const evt_target_id = evt.target.id;
        const evt_target_value = evt.target.value.trim();
        if (evt_target_id == "product_name" && !(evt_target_value.length)) throw (new Error("Product name is required"));
        if (evt_target_id == "product_name" && (evt_target_value.length)) elErrorAlert.classList.add("d-none");
        if (evt_target_id == "product_img") {
            if (!(evt.target.files[0])) throw (new Error("Product picture is required"));
            if (evt.target.files[0]) elErrorAlert.classList.add("d-none");
        };
        if (evt_target_id == "product_price") {
            if (!(evt_target_value.length)) throw (new Error("Product price is required"));
            if (evt_target_value) elErrorAlert.classList.add("d-none");
        };
        if (evt_target_id == "product-desc" && !(evt_target_value.length)) throw (new Error("Product description is required"));
        if (evt_target_id == "product-desc" && (evt_target_value.length)) elErrorAlert.classList.add("d-none");
    } catch (error) {
        elErrorAlert.classList.remove("d-none");
        elErrorAlert.querySelector(".js-error-title").textContent = error.message;
    }
};

const handlePostProductFn = async evt => {
    try {
        evt.preventDefault()
        const form_data = new FormData();
        form_data.append("product_name", elProductNameInp.value);
        form_data.append("product_desc", elProductDescriptionTextarea.value);
        form_data.append("product_img", elProductImgInp.files[0]);
        form_data.append("product_price", elProductPriceInp.value);
        const req = await fetch(BASE_URL + "product", {
            method: "POST",
            headers: {
                authorization: getItem("token")
            },
            body: form_data
        });
        if (req.ok) {
            elProductNameInp.value = "";
            elProductDescriptionTextarea.value = "";
            elProductPriceInp.value = "";
            elProductImgInp.value = "";
            const product = await handleGetProductFn();
            handleRenderProducts(product)
        }
    } catch (err) {
        console.log(err)
    }
}
let product_edit_ = "";
const handleProductDeleteAndEditPreparationFn = async evt => {
    try {
        const evt_target = evt.target;
        const datasetId = evt_target.dataset.id;
        if (evt_target.matches(".js-edit-product-btn") || evt_target.matches(".js-edit-product-icon")) {
            const find_product = (await products).find(({ id }) => id == datasetId);
            if (find_product) {
                product_edit_ += JSON.stringify(find_product);
                elProductEditNameInp.defaultValue = find_product.product_name;
                elProductEditPriceInp.defaultValue = find_product.product_price;
                elProductEditDescriptionTextarea.defaultValue = find_product.product_desc;
                return;
            }
        };
        if (evt_target.matches(".js-delete-product-btn") || evt_target.matches(".js-delete-product-icon")) {
            if (datasetId) {
                const req = await fetch(BASE_URL + "product/" + datasetId, {
                    method: "DELETE",
                    headers: {
                        authorization: getItem("token")
                    }
                });
                if (req.ok) {
                    const product = await handleGetProductFn();
                    handleRenderProducts(product)
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const handleEditProductFn = async evt => {
    try {
        evt.preventDefault();
        const product = JSON.parse(product_edit_);
        const form_data = new FormData();
        form_data.append("product_name", (elProductEditNameInp.value.trim() || product.product_name))
        form_data.append("product_desc", ( product?.product_desc?  product.product_desc : elProductEditDescriptionTextarea.value.trim()))
        form_data.append("product_img", (elProductEditImgInp.files[0]))
        form_data.append("product_price", (elProductEditPriceInp.value.trim() || product.product_price))
        if (form_data) {
            const req = await fetch(BASE_URL + "product/" + product.id, {
                method: "PUT",
                headers: {
                    authorization: getItem("token")
                },
                body: form_data
            });
            if (req.ok) {
                const product = await handleGetProductFn();
                handleRenderProducts(product);
            }
        }

    } catch (error) {
        console.log(error);
    }
}

elLogOutBtn.addEventListener("click", () => {
    removeItem("token");
    window.location = "/index.html"
});
elBtnOk.addEventListener("click", () => elErrorAlert.classList.add("d-none"));
elProductsList.addEventListener("click", handleProductDeleteAndEditPreparationFn);

elProductNameInp.addEventListener("blur", handleInputChangeAndBlur);
elProductImgInp.addEventListener("blur", handleInputChangeAndBlur);
elProductPriceInp.addEventListener("blur", handleInputChangeAndBlur);
elProductDescriptionTextarea.addEventListener("blur", handleInputChangeAndBlur);

elProductNameInp.addEventListener("change", handleInputChangeAndBlur);
elProductImgInp.addEventListener("change", handleInputChangeAndBlur);
elProductPriceInp.addEventListener("change", handleInputChangeAndBlur);
elProductDescriptionTextarea.addEventListener("change", handleInputChangeAndBlur);

elAddProductForm.addEventListener("submit", handlePostProductFn);
elProductEditModalForm.addEventListener("submit", handleEditProductFn)

