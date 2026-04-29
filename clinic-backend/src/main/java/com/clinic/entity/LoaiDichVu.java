package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loai_dich_vu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoaiDichVu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_loai_dich_vu")
    private Long id;

    @Column(name = "ten_loai_dich_vu", nullable = false)
    private String tenLoaiDichVu;
}
