package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chuyen_khoa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChuyenKhoa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_chuyen_khoa")
    private Long id;

    @Column(name = "ten_chuyen_khoa", nullable = false)
    private String tenChuyenKhoa;
}
