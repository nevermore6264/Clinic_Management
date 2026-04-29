package com.clinic.config;

import com.clinic.entity.BacSi;
import com.clinic.entity.ChuyenKhoa;
import com.clinic.entity.VaiTro;
import com.clinic.entity.NguoiDung;
import com.clinic.repository.ChuyenKhoaRepository;
import com.clinic.repository.NguoiDungRepository;
import com.clinic.repository.BacSiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final NguoiDungRepository nguoiDungRepository;
    private final BacSiRepository bacSiRepository;
    private final ChuyenKhoaRepository chuyenKhoaRepository;
    private final PasswordEncoder maHoaMatKhau;

    @Override
    public void run(String... args) {
        if (nguoiDungRepository.findByTenDangNhap("admin").isEmpty()) {
            NguoiDung quanTri = new NguoiDung();
            quanTri.setTenDangNhap("admin");
            quanTri.setMatKhauBam(maHoaMatKhau.encode("admin123"));
            quanTri.setHoTen("Quản trị viên");
            quanTri.setCacVaiTro(Set.of(VaiTro.QUAN_TRI));
            quanTri.setHoatDong(true);
            nguoiDungRepository.save(quanTri);
        }
        if (nguoiDungRepository.findByTenDangNhap("reception").isEmpty()) {
            NguoiDung leTan = new NguoiDung();
            leTan.setTenDangNhap("reception");
            leTan.setMatKhauBam(maHoaMatKhau.encode("reception123"));
            leTan.setHoTen("Lễ tân");
            leTan.setCacVaiTro(Set.of(VaiTro.LE_TAN));
            leTan.setHoatDong(true);
            nguoiDungRepository.save(leTan);
        }
        if (nguoiDungRepository.findByTenDangNhap("doctor1").isEmpty()) {
            NguoiDung taiKhoanBs = new NguoiDung();
            taiKhoanBs.setTenDangNhap("doctor1");
            taiKhoanBs.setMatKhauBam(maHoaMatKhau.encode("doctor123"));
            taiKhoanBs.setHoTen("Bác sĩ Nguyễn Văn A");
            taiKhoanBs.setCacVaiTro(Set.of(VaiTro.BAC_SI));
            taiKhoanBs.setHoatDong(true);
            taiKhoanBs = nguoiDungRepository.save(taiKhoanBs);
            ChuyenKhoa noiTongQuat = chuyenKhoaRepository
                    .findByTenChuyenKhoa("Nội tổng quát")
                    .orElseGet(() -> chuyenKhoaRepository.save(
                            ChuyenKhoa.builder().tenChuyenKhoa("Nội tổng quát").build()));
            BacSi bacSi = new BacSi();
            bacSi.setNguoiDung(taiKhoanBs);
            bacSi.setChuyenKhoa(noiTongQuat);
            bacSi.setBangCap("Bác sĩ đa khoa");
            bacSiRepository.save(bacSi);
        }
        if (nguoiDungRepository.findByTenDangNhap("cashier").isEmpty()) {
            NguoiDung thuNgan = new NguoiDung();
            thuNgan.setTenDangNhap("cashier");
            thuNgan.setMatKhauBam(maHoaMatKhau.encode("cashier123"));
            thuNgan.setHoTen("Thu ngân");
            thuNgan.setCacVaiTro(Set.of(VaiTro.THU_NGAN));
            thuNgan.setHoatDong(true);
            nguoiDungRepository.save(thuNgan);
        }
    }
}
