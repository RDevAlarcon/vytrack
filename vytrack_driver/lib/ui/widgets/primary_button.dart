import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final Color? color;
  const PrimaryButton({super.key, required this.label, this.onPressed, this.loading = false, this.color});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: color ?? Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 44),
      ),
      onPressed: loading ? null : onPressed,
      child: loading ? const CircularProgressIndicator(color: Colors.white) : Text(label),
    );
  }
}
