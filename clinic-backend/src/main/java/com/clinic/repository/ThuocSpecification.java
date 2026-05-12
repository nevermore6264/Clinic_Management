package com.clinic.repository;

import com.clinic.entity.Thuoc;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class ThuocSpecification {

    private ThuocSpecification() {
    }

    public static Specification<Thuoc> tuKhoaChua(String tuKhoa) {
        if (tuKhoa == null || tuKhoa.isBlank()) {
            return null;
        }
        String p = "%" + tuKhoa.trim().toLowerCase() + "%";
        return (root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("tenThuoc")), p),
                cb.like(cb.lower(cb.coalesce(root.get("hoatChat"), "")), p),
                cb.like(cb.lower(cb.coalesce(root.get("hamLuong"), "")), p),
                cb.like(cb.lower(cb.coalesce(root.get("dangBaoChe"), "")), p),
                cb.like(cb.lower(cb.coalesce(root.get("duongDung"), "")), p),
                cb.like(cb.lower(cb.coalesce(root.get("donVi"), "")), p),
                cb.like(cb.lower(cb.coalesce(root.get("hangSanXuat"), "")), p),
                cb.like(cb.lower(cb.coalesce(root.get("nuocSanXuat"), "")), p),
                cb.like(cb.lower(cb.coalesce(root.get("soDangKy"), "")), p),
                cb.like(cb.lower(cb.coalesce(root.get("soLo"), "")), p)
        );
    }

    public static Specification<Thuoc> trangThaiHoatDong(String mode) {
        if (mode == null || mode.isBlank() || "tat-ca".equalsIgnoreCase(mode)) {
            return null;
        }
        if ("dang-dung".equalsIgnoreCase(mode)) {
            return (root, q, cb) -> cb.isTrue(root.get("hoatDong"));
        }
        if ("ngung".equalsIgnoreCase(mode)) {
            return (root, q, cb) -> cb.isFalse(root.get("hoatDong"));
        }
        return null;
    }

    public static Specification<Thuoc> donViBang(String donVi) {
        if (donVi == null || donVi.isBlank()) {
            return null;
        }
        return (root, q, cb) -> cb.equal(root.get("donVi"), donVi);
    }

    public static Specification<Thuoc> dangBaoCheBang(String dangBaoChe) {
        if (dangBaoChe == null || dangBaoChe.isBlank()) {
            return null;
        }
        return (root, q, cb) -> cb.equal(root.get("dangBaoChe"), dangBaoChe);
    }

    public static Specification<Thuoc> hangSanXuatBang(String hang) {
        if (hang == null || hang.isBlank()) {
            return null;
        }
        return (root, q, cb) -> cb.equal(root.get("hangSanXuat"), hang);
    }

    public static Specification<Thuoc> nuocSanXuatBang(String nuoc) {
        if (nuoc == null || nuoc.isBlank()) {
            return null;
        }
        return (root, q, cb) -> cb.equal(root.get("nuocSanXuat"), nuoc);
    }

    public static Specification<Thuoc> duongDungBang(String duongDung) {
        if (duongDung == null || duongDung.isBlank()) {
            return null;
        }
        return (root, q, cb) -> cb.equal(root.get("duongDung"), duongDung);
    }

    public static Specification<Thuoc> chiTonThap(boolean bat) {
        if (!bat) {
            return null;
        }
        return (root, q, cb) -> {
            var ton = cb.coalesce(root.get("tonKho"), 0);
            var muc = cb.coalesce(root.get("mucTonToiThieu"), 0);
            return cb.lessThanOrEqualTo(ton, muc);
        };
    }

    public static Specification<Thuoc> hanSuDungTu(LocalDate tu) {
        if (tu == null) {
            return null;
        }
        return (root, q, cb) -> cb.and(
                cb.isNotNull(root.get("hanSuDung")),
                cb.greaterThanOrEqualTo(root.get("hanSuDung"), tu)
        );
    }

    public static Specification<Thuoc> hanSuDungDen(LocalDate den) {
        if (den == null) {
            return null;
        }
        return (root, q, cb) -> cb.and(
                cb.isNotNull(root.get("hanSuDung")),
                cb.lessThanOrEqualTo(root.get("hanSuDung"), den)
        );
    }

    public static Specification<Thuoc> giaBanTu(BigDecimal tu) {
        if (tu == null) {
            return null;
        }
        return (root, q, cb) -> cb.and(
                cb.isNotNull(root.get("giaBan")),
                cb.greaterThanOrEqualTo(root.get("giaBan"), tu)
        );
    }

    public static Specification<Thuoc> giaBanDen(BigDecimal den) {
        if (den == null) {
            return null;
        }
        return (root, q, cb) -> cb.and(
                cb.isNotNull(root.get("giaBan")),
                cb.lessThanOrEqualTo(root.get("giaBan"), den)
        );
    }
}
