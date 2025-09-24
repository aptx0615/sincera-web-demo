class SinceraFooter {
    constructor() {
        this.init();
    }

    init() {
        this.renderFooter();
        this.setupEventListeners();
    }

    renderFooter() {
        const footerHTML = `
            <footer class="footer-section">
                <div class="footer-container">
                    <!-- Policies Grid -->
                    <div class="footer-policies">
                        <div class="policy-item">
                        <span class="policy-icon">
                            <img src="images/icon-1.svg">
                        </span>
                            <div class="policy-title">VỆ SINH BẠC TRỌN ĐỜI</div>
                            <div class="policy-description">Vệ sinh bạc không giới hạn số lần cho mọi đơn hàng (trừ đơn từ sàn TMĐT)</div>
                        </div>

                        <div class="policy-item">
                        <span class="policy-icon">
                            <img src="images/icon-2.svg">
                        </span>
                            <div class="policy-title">7 NGÀY ĐỔI HÀNG KHI CÓ LỖI TỪ SẢN PHẨM</div>
                            <div class="policy-description">Vui lòng tham khảo chính sách chi tiết tại mục "Chính sách bảo hành"</div>
                        </div>

                        <div class="policy-item">
                            <span class="policy-icon">
                                <img src="images/icon-3.svg">
                            </span>
                            <div class="policy-title">CAM KẾT 100% BẠC S925-950</div>
                            <div class="policy-description">Hoàn tiền 100% nếu kết quả quang phổ không đúng hàm lượng công bố</div>
                        </div>

                        <div class="policy-item">
                            <span class="policy-icon">
                                <img src="images/icon-4.svg">
                            </span>
                            <div class="policy-title">MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC</div>
                            <div class="policy-description">Áp dụng cho mọi đơn hàng từ 300K</div>
                        </div>
                    </div>

                    <!-- Contact Section -->
                    <div class="footer-contact">
                        <div class="contact-info">
                            <div class="contact-item" onclick="window.open('mailto:sincera.vn@gmail.com', '_blank')">
                                <span>Email: </span>
                                <span>sincera.vn@gmail.com</span>
                            </div>
                            <div class="contact-item" onclick="window.open('tel:0906634756', '_self')">
                                <span>Điện thoại hỗ trợ: </span>
                                <span>0906 634 756</span>
                            </div>
                            <div class="contact-item" onclick="window.open('https://couple.sincera.vn', '_blank')">
                                <span>Chính sách bảo hành </span>
                            </div>
                        </div>

                        <!-- Copyright -->
                        <div class="footer-copyright">
                            <span>&copy; ${new Date().getFullYear()} SINCERA. All Rights Reserved <br> Thương hiệu đã được đăng ký bảo hộ tại Cục Sở hữu trí tuệ </span>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        // Insert footer at the end of body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
}

// Auto-initialize footer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const sinceraFooter = new SinceraFooter();
    window.SinceraFooter = sinceraFooter;
});