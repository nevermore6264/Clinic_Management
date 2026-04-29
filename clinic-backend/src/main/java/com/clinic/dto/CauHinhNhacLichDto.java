package com.clinic.dto;

import lombok.Data;

@Data
public class CauHinhNhacLichDto {
    private Long id;
    private Integer soNgayTruoc;
    private Integer soGioTruoc;
    private boolean batThuDienTu;
    private boolean batTinNhan;
}
