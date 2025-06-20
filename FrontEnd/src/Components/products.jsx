import "./products.css";
import React, { useState, useEffect } from "react";
import { useTranslation } from "../TranslationContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Products({ showProducts }) {
  const { translations, language } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/category`)
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, [language]);

  categories.forEach((category) => {
    console.log("image url", "https://" + category.imagePath);
  });
  return (
    <>
      {showProducts && (
        <section>
          <div className="pr">
            {Array.isArray(categories) &&
              categories.map((category) => (
                <div
                  key={category.id}
                  className="col d-flex flex-column mb-3 w-25"
                >
                  <a className="text-decoration-none text-dark">
                    <div
                      className="box"
                      onClick={() => {
                        localStorage.setItem("categoryId", category.id);
                        navigate("/categoryPage", {
                          state: {
                            categoryId: category.id,
                            categoryName:
                              language === "ar"
                                ? category.nameAr
                                : category.nameEn,
                          },
                        });
                      }}
                    >
                      <div className="boximg">
                        {category.imagePath ? (
                          <img
                            src={"https://" + category.imagePath}
                            className="card-img-top"
                            alt={category.name}
                          />
                        ) : (
                          <p>No Image Available</p>
                        )}
                      </div>
                      <div className="card-body text-center">
                        <h5 className="card-title">
                          {language === "ar"
                            ? category.nameAr
                            : category.nameEn}
                        </h5>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
          </div>
          <hr id="hr" />
        </section>
      )}
    </>
  );
}
