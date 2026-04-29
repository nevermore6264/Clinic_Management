package com.clinic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "nhat_ky_nhac_lich")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhatKyNhacLich {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ma_lich_hen", nullable = false)
    private LichHen lichHen;

    @Enumerated(EnumType.STRING)
    @Column(name = "kenh")
    private KenhNhac kenh;

    @Column(name = "luc_gui")
    private Instant lucGui;

    @PrePersist
    void luuTruoc() {
        if (lucGui == null) lucGui = Instant.now();
    }

    public enum KenhNhac {
        THU_DIEN_TU,
        TIN_NHAN
    }
}
