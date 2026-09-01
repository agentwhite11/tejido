#!/usr/bin/env python3
"""Compatibilidad: el arranque del proyecto delega toda la lógica en el módulo backend.app."""

from backend.app import main


if __name__ == "__main__":
    main()
