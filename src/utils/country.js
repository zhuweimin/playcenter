// src/utils/countryUtils.js
import countryJson from "@/assets/json/top_50_countries.json";

/**
 * 国家代码转换工具
 */
class CountryConverter {
  constructor() {
    this.countryMap = this.initCountryMap();
  }

  /**
   * 初始化国家映射表
   */
  initCountryMap() {
    const map = {};
    if (countryJson && Array.isArray(countryJson)) {
      countryJson.forEach(country => {
        if (country.alpha2 && country.zh) {
          map[country.alpha2] = country.zh;
        }
      });
    }
    return map;
  }

  /**
   * 获取国家中文名称
   * @param {string} countryCode - 国家代码(如: US, CN)
   * @returns {string} 国家中文名称
   */
  getCountryName(countryCode) {
    if (!countryCode) return '';
    return this.countryMap[countryCode] || countryCode;
  }

  /**
   * 获取国家映射对象
   * @returns {Object} 国家映射对象
   */
  getCountryMap() {
    return { ...this.countryMap };
  }
}

// 导出单例实例
export const countryConverter = new CountryConverter();

// 为了向后兼容，也导出原来的 countryMap
export const countryMap = countryConverter.getCountryMap();
